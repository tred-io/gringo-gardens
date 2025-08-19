import React, { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "./ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
      // Add concurrency limits to prevent bulk upload failures
      meta: {},
      // Allow retries for failed uploads
      allowMultipleUploadBatches: true,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        // Add concurrency limits for production stability  
        limit: 3,
        // Add retry logic for failed uploads
        retryDelays: [0, 1000, 3000],

        getUploadParameters: async (file) => {
          console.log("Getting upload parameters for file:", file.name, file.type);
          try {
            const params = await onGetUploadParameters();
            console.log("Received upload parameters:", params);
            
            // Validate URL before proceeding
            if (!params.url || typeof params.url !== 'string') {
              throw new Error('Invalid upload URL received from server');
            }
            
            let uploadUrl = params.url;
            
            // For Vercel Blob uploads, add object name as query parameter
            if (uploadUrl.includes('/api/blob/upload')) {
              const timestamp = Date.now();
              const objectName = `gallery/uploads/${timestamp}_${file.name}`;
              file.meta = { ...file.meta, objectName };
              
              if (!uploadUrl.includes('objectName=')) {
                uploadUrl += `?objectName=${encodeURIComponent(objectName)}`;
              }
            }
            
            // Final URL validation
            try {
              new URL(uploadUrl, window.location.origin);
            } catch (urlError) {
              throw new Error(`Invalid URL format: ${uploadUrl}`);
            }
            
            return {
              method: params.method || "PUT",
              url: uploadUrl
            };
          } catch (error) {
            console.error("Error getting upload parameters:", error);
            throw error;
          }
        },

      })
      .on("complete", (result) => {
        console.log("Uppy upload complete - full result:", JSON.stringify(result, null, 2));
        onComplete?.(result);
        setShowModal(false);
      })
      .on("upload-success", (file, response) => {
        if (!file) return;
        
        console.log("Upload success - file:", file.name);
        console.log("Upload success - response:", response);
        
        // Extract blob URL from response body
        if (response && response.body) {
          let blobURL = null;
          
          // Parse response if it's a string
          let responseData = response.body;
          if (typeof responseData === 'string') {
            try {
              responseData = JSON.parse(responseData);
            } catch (e) {
              console.error("Failed to parse response:", e);
            }
          }
          
          // Get the blob URL from the response
          if (responseData && responseData.url) {
            blobURL = responseData.url;
            (file as any).blobURL = blobURL;
            console.log("Stored blob URL:", blobURL);
          }
        }
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}