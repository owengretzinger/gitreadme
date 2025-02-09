import { type UseFormReturn } from "react-hook-form";
import { type ReadmeFormData } from "~/hooks/use-readme-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Loader2 } from "lucide-react";

interface UrlFormProps {
  form: UseFormReturn<ReadmeFormData>;
  isLoading: boolean;
  onSubmit: () => void;
}

export function UrlForm({ form, isLoading, onSubmit }: UrlFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 pt-2">
        <h3 className="text-lg font-semibold">GitHub Repository URL</h3>
        <Form {...form}>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="repoUrl"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Enter repository URL..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button onClick={() => onSubmit()} disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate README
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
} 