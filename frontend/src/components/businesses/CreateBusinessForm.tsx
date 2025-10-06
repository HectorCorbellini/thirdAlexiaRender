import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { businessAPI } from "@/services/api";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  category: z.string().optional(),
});

interface CreateBusinessFormProps {
  setOpen: (open: boolean) => void;
}

export function CreateBusinessForm({ setOpen }: CreateBusinessFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (newBusiness: z.infer<typeof formSchema>) => {
      return businessAPI.create(newBusiness);
    },
    onSuccess: () => {
      toast.success("Business created successfully!");
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create business.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Pizza Palace" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Best pizza in town" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Restaurant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending} className="w-full bg-gradient-primary">
          {mutation.isPending ? "Creating..." : "Create Business"}
        </Button>
      </form>
    </Form>
  );
}
