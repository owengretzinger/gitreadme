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

interface UrlFormProps {
  form: UseFormReturn<ReadmeFormData>;
  onSubmit: () => void;
}

export function UrlForm({ form, onSubmit }: UrlFormProps) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <h3 className="text-lg font-semibold">GitHub Repository URL</h3>
      <Form {...form}>
        <div className="flex flex-col gap-4 md:flex-row">
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
          <Button onClick={() => onSubmit()}>Generate README</Button>
        </div>
      </Form>
    </div>
  );
}
