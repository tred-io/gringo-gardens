/**
 * Plain English Form Messages
 *
 * Replaces technical Zod validation messages with user-friendly text
 * that non-technical users can understand.
 */

export const formMessages = {
  // Generic required field messages
  required: (fieldName: string) => `Please enter ${fieldName.toLowerCase()}`,
  requiredSelect: (fieldName: string) => `Please select ${fieldName.toLowerCase()}`,

  // Field-specific friendly messages
  productName: {
    required: "Please enter a product name",
    tooShort: "Product name is too short (minimum 2 characters)",
  },
  productDescription: {
    required: "Please add a description to help customers learn about this product",
    tooShort: "Please add more detail to the description (minimum 10 characters)",
  },
  productPrice: {
    invalid: "Please enter a valid price (e.g., 12.99)",
    negative: "Price cannot be negative",
  },
  productStock: {
    invalid: "Please enter a valid stock quantity",
    negative: "Stock cannot be negative",
  },
  category: {
    required: "Please select a category for this product",
  },
  imageUrl: {
    required: "Please add an image",
    invalid: "Please enter a valid image URL (must start with http:// or https://)",
  },

  // Blog post messages
  blogTitle: {
    required: "Please enter a blog post title",
    tooShort: "Title is too short (minimum 5 characters)",
  },
  blogContent: {
    required: "Please add content for your blog post",
    tooShort: "Blog post needs more content (minimum 50 characters)",
  },
  blogExcerpt: {
    tooLong: "Excerpt is too long (maximum 200 characters). Keep it short and engaging.",
  },

  // Gallery messages
  galleryTitle: {
    required: "Please add a title for this image",
  },
  galleryDescription: {
    recommended: "Adding a description helps with SEO and accessibility",
  },
  tags: {
    recommended: "Tags help customers find related plants and images",
  },

  // Category messages
  categoryName: {
    required: "Please enter a category name",
    duplicate: "A category with this name already exists",
  },
  categoryDescription: {
    recommended: "A description helps customers understand what's in this category",
  },

  // Review messages
  customerName: {
    required: "Please enter the customer's name",
  },
  rating: {
    required: "Please add a star rating (1-5)",
    outOfRange: "Rating must be between 1 and 5 stars",
  },
  reviewContent: {
    required: "Please enter the review text",
    tooShort: "Review is too short (minimum 10 characters)",
  },

  // Team member messages
  teamName: {
    required: "Please enter the team member's name",
  },
  teamPosition: {
    required: "Please enter their position/title (e.g., 'Owner', 'Head Gardener')",
  },
  teamBio: {
    recommended: "A bio helps customers get to know your team",
  },

  // Contact/Settings messages
  email: {
    invalid: "Please enter a valid email address (e.g., name@example.com)",
    required: "Please enter an email address",
  },
  phone: {
    invalid: "Please enter a valid phone number",
  },
  url: {
    invalid: "Please enter a valid website URL (must start with http:// or https://)",
  },

  // Generic validation messages
  generic: {
    required: "This field is required",
    tooShort: "This is too short - please add more detail",
    tooLong: "This is too long - please shorten it",
    invalid: "This doesn't look right - please check your entry",
  },
};

/**
 * Helper function to get user-friendly error message
 */
export function getFriendlyErrorMessage(
  fieldName: string,
  errorType: string,
  customMessage?: string
): string {
  if (customMessage) return customMessage;

  // Map technical Zod errors to friendly messages
  const errorMap: Record<string, string> = {
    "too_small": formMessages.generic.tooShort,
    "too_big": formMessages.generic.tooLong,
    "invalid_string": formMessages.generic.invalid,
    "invalid_type": formMessages.generic.invalid,
  };

  return errorMap[errorType] || formMessages.generic.required;
}

/**
 * Zod error map for automatic friendly messages
 */
export function createFriendlyErrorMap() {
  return (issue: any, ctx: any) => {
    if (issue.code === "too_small") {
      if (issue.minimum === 1) {
        return { message: formMessages.required(issue.path[0] || "this field") };
      }
      return { message: formMessages.generic.tooShort };
    }

    if (issue.code === "too_big") {
      return { message: formMessages.generic.tooLong };
    }

    if (issue.code === "invalid_string") {
      if (issue.validation === "email") {
        return { message: formMessages.email.invalid };
      }
      if (issue.validation === "url") {
        return { message: formMessages.url.invalid };
      }
    }

    return { message: ctx.defaultError };
  };
}
