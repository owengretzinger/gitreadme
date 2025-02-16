// import { type UseFormReturn } from "react-hook-form";
// import { type ReadmeFormData, type RateLimitInfo } from "~/hooks/use-readme-form";
// import { Button } from "~/components/ui/button";
// import { Input } from "~/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "~/components/ui/form";
// import { RateLimitInfo as RateLimitInfoComponent } from "./rate-limit-info";
// import { useSession } from "next-auth/react";

// interface UrlFormProps {
//   form: UseFormReturn<ReadmeFormData>;
//   onSubmit: () => void;
//   rateLimitInfo: RateLimitInfo | null;
// }

// export function UrlForm({ form, onSubmit, rateLimitInfo }: UrlFormProps) {
//   const { data: session } = useSession();

//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold">GitHub Repository URL</h3>
//         <RateLimitInfoComponent rateLimitInfo={rateLimitInfo} session={session} />
//       </div>
//       <Form {...form}>
//         <div className="flex flex-col gap-4 md:flex-row">
//           <FormField
//             control={form.control}
//             name="repoUrl"
//             render={({ field }) => (
//               <FormItem className="flex-1">
//                 <FormControl>
//                   <Input placeholder="Enter repository URL..." {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <Button onClick={() => onSubmit()}>Generate README</Button>
//         </div>
//       </Form>
//     </div>
//   );
// }
