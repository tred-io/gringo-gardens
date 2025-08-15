import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      form.reset();
      setIsSubmitting(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ContactFormData) => {
    setIsSubmitting(true);
    contactMutation.mutate(data);
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-bluebonnet-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our expert team for plant advice, orders, or visit our nursery in Lampasas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-bluebonnet-900 mb-6">Send Us a Message</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="plant-advice">Plant Care Advice</SelectItem>
                          <SelectItem value="order-inquiry">Order Inquiry</SelectItem>
                          <SelectItem value="nursery-visit">Nursery Visit</SelectItem>
                          <SelectItem value="bulk-order">Bulk Orders</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={5}
                          placeholder="Tell us how we can help you..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-bluebonnet-600 hover:bg-bluebonnet-700 text-lg py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Contact Information & Map */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-bluebonnet-50 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-bluebonnet-900 mb-2">Visit Our Nursery</h2>
                <p className="text-bluebonnet-700">Serving Central Texas & Beyond</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-bluebonnet-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="font-semibold text-bluebonnet-900">Address</h3>
                    <p className="text-gray-700">4041 FM 1715<br />Lampasas, TX 76550</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-bluebonnet-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="font-semibold text-bluebonnet-900">Email</h3>
                    <p className="text-gray-700">info@gringogardens.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-bluebonnet-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="font-semibold text-bluebonnet-900">Hours</h3>
                    <div className="text-gray-700">
                      <p>Monday - Saturday: 8:00 AM - 6:00 PM</p>
                      <p>Sunday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="bg-gray-200 rounded-2xl h-64 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.5678901234567!2d-98.1734567!3d31.0645678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z4041+FM+1715%2C+Lampasas%2C+TX+76550!5e0!3m2!1sen!2sus!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gringo Gardens Location"
              />
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-bluebonnet-900 mb-4">Service Areas</h3>
              <p className="text-gray-700 mb-4">We proudly serve customers throughout Central Texas and beyond:</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>• Lampasas County</div>
                <div>• Burnet County</div>
                <div>• Williamson County</div>
                <div>• Bell County</div>
                <div>• Travis County</div>
                <div>• Llano County</div>
              </div>
              <p className="text-sm text-bluebonnet-600 mt-4">Statewide delivery available for larger orders</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
