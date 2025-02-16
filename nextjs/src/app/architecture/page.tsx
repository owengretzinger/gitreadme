// "use client";

// import { Suspense } from "react";
// import { useState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { api } from "~/trpc/react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "~/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/components/ui/form";
// import { Input } from "~/components/ui/input";
// import { Button } from "~/components/ui/button";
// import { useToast } from "~/hooks/use-toast";
// import { Toaster } from "~/components/ui/toaster";
// import { ChevronDown, ChevronUp, Download, Copy, Check } from "lucide-react";
// import { type ViewMode } from "~/components/view-mode-toggle";
// import { MarkdownDisplay } from "~/components/markdown-display";

// const formSchema = z.object({
//   repoUrl: z.string().url("Please enter a valid URL"),
//   excludePatterns: z.array(z.string()).default([]),
// });

// function ArchitectureForm() {
//   const [generatedDiagram, setGeneratedDiagram] = useState<string | null>(null);
//   const [repoPackerOutput, setrepoPackerOutput] = useState<string | null>(null);
//   const [showrepoPackerOutput, setShowrepoPackerOutput] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [diagramViewMode, setDiagramViewMode] = useState<ViewMode>("preview");
//   const [isCopied, setIsCopied] = useState(false);
//   const { toast } = useToast();

//   const generateDiagram = api.architecture.generateDiagram.useMutation({
//     onSuccess: async (data) => {
//       if (!data.success) {
//         if (data.largestFiles) {
//           // Show toast with option to exclude largest files
//           toast({
//             variant: "destructive",
//             title: "Repository too large",
//             description: (
//               <div className="mt-2 space-y-2">
//                 <p>{data.error}</p>
//                 <p className="font-semibold">Largest files:</p>
//                 <ul className="list-inside list-disc space-y-1">
//                   {data.largestFiles.map((file) => (
//                     <li key={file.path}>
//                       {file.path} ({file.size_kb.toFixed(1)} KB)
//                     </li>
//                   ))}
//                 </ul>
//                 <Button
//                   variant="outline"
//                   className="mt-2"
//                   onClick={() => {
//                     const patterns = data.largestFiles?.map((f) => f.path) ?? [];
//                     form.setValue("excludePatterns", patterns);
//                     void form.handleSubmit(handleSubmit)();
//                   }}
//                 >
//                   Retry excluding these files
//                 </Button>
//               </div>
//             ),
//           });
//         } else {
//           toast({
//             variant: "destructive",
//             title: "Error",
//             description: data.error,
//           });
//         }
//         setGeneratedDiagram(null);
//         setrepoPackerOutput(null);
//       } else {
//         toast({
//           description: "Architecture diagram generated successfully!",
//         });
//         setGeneratedDiagram(data.diagram);
//         setrepoPackerOutput(data.repoPackerOutput ?? null);
//       }
//       setIsLoading(false);
//     },
//     onError: () => {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to connect to server. Please try again.",
//       });
//       setIsLoading(false);
//       setGeneratedDiagram(null);
//       setrepoPackerOutput(null);
//     },
//   });

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       repoUrl: "",
//       excludePatterns: [],
//     },
//   });

//   const handleSubmit = async (values: z.infer<typeof formSchema>) => {
//     setIsLoading(true);
//     setGeneratedDiagram(null);
//     setrepoPackerOutput(null);
//     setShowrepoPackerOutput(false);
//     await generateDiagram.mutateAsync(values);
//   };

//   const handleCopyCode = () => {
//     if (!generatedDiagram) return;
//     void navigator.clipboard.writeText(generatedDiagram).then(() => {
//       setIsCopied(true);
//       setTimeout(() => setIsCopied(false), 2000);
//     });
//   };

//   const downloadSvgAsPng = () => {
//     // Get the rendered SVG from the Mermaid component
//     const svgElement = document.querySelector(".mermaid svg");
//     if (!(svgElement instanceof SVGSVGElement)) return;

//     try {
//       // Create canvas with proper dimensions
//       const canvas = document.createElement("canvas");
//       const scale = 4;

//       // Set canvas size based on SVG's bounding box
//       const bbox = svgElement.getBBox();
//       const transform = svgElement.getScreenCTM();
//       if (!transform) return;

//       // Calculate actual dimensions
//       const width = Math.ceil(bbox.width * transform.a);
//       const height = Math.ceil(bbox.height * transform.d);
//       canvas.width = width * scale;
//       canvas.height = height * scale;

//       const ctx = canvas.getContext("2d");
//       if (!ctx) return;

//       // Convert SVG to image
//       const svgData = new XMLSerializer().serializeToString(svgElement);
//       const img = new Image();

//       img.onload = () => {
//         // Draw white background
//         ctx.fillStyle = "white";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         // Draw scaled image
//         ctx.scale(scale, scale);
//         ctx.drawImage(img, 0, 0, width, height);

//         // Download
//         const a = document.createElement("a");
//         a.download = "architecture-diagram.png";
//         a.href = canvas.toDataURL("image/png", 1.0);
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//       };

//       img.src =
//         "data:image/svg+xml;base64," +
//         btoa(unescape(encodeURIComponent(svgData)));
//     } catch (error) {
//       console.error("Error generating PNG:", error);
//     }
//   };

//   return (
//     <>
//       <div className="container mx-auto py-10">
//         <Card className="mx-auto max-w-4xl">
//           <CardHeader>
//             <CardTitle>Architecture Diagram Generator</CardTitle>
//             <CardDescription>
//               <>
//                 Enter a public GitHub repository URL to generate an architecture
//                 diagram using AI.
//               </>
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(handleSubmit)}
//                 className="space-y-8"
//               >
//                 <FormField
//                   control={form.control}
//                   name="repoUrl"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Repository URL</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder="https://github.com/user/repo"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading ? "Generating..." : "Generate Diagram"}
//                 </Button>
//               </form>
//             </Form>

//             {generatedDiagram && (
//               <div className="mt-8 space-y-8">
//                 <MarkdownDisplay
//                   title="Architecture Diagram"
//                   content={generatedDiagram}
//                   viewMode={diagramViewMode}
//                   setViewMode={setDiagramViewMode}
//                   actions={[
//                     {
//                       icon: Download,
//                       onClick: downloadSvgAsPng,
//                       showInMode: "preview",
//                     },
//                     {
//                       icon: isCopied ? Check : Copy,
//                       onClick: handleCopyCode,
//                       showInMode: "edit",
//                     },
//                   ]}
//                   isMermaid
//                 />

//                 {repoPackerOutput && (
//                   <div>
//                     <Button
//                       variant="outline"
//                       className="mb-4 w-full"
//                       onClick={() => setShowrepoPackerOutput(!showrepoPackerOutput)}
//                     >
//                       {showrepoPackerOutput ? (
//                         <ChevronUp className="mr-2 h-4 w-4" />
//                       ) : (
//                         <ChevronDown className="mr-2 h-4 w-4" />
//                       )}
//                       {showrepoPackerOutput ? "Hide" : "Show"} repoPacker Output
//                     </Button>
//                     {showrepoPackerOutput && (
//                       <div className="rounded-lg border p-4">
//                         <pre className="whitespace-pre-wrap text-sm">
//                           {repoPackerOutput}
//                         </pre>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//       <Toaster />
//     </>
//   );
// }

// export default function ArchitecturePage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <ArchitectureForm />
//     </Suspense>
//   );
// }
