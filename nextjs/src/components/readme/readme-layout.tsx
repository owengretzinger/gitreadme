// import { type ViewMode } from "~/components/view-mode-toggle";
// import { Tabs, TabsContent } from "~/components/ui/tabs";
// import { GeneratedReadme } from "./generated-readme";
// import { ReadmeInfoCard } from "./readme-info-card";
// import { GenerationState } from "~/hooks/use-readme-form";
// import { type ReactNode } from "react";
// import { Button } from "~/components/ui/button";
// import { ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";

// type ActiveTab = "settings" | "readme";

// interface ReadmeLayoutProps {
//   activeTab: ActiveTab;
//   setActiveTab: (tab: ActiveTab) => void;
//   readmeViewMode: ViewMode;
//   setReadmeViewMode: (mode: ViewMode) => void;
//   repoPath: string;
//   version: number;
//   createdAt: Date | null;
//   currentUrl: string;
//   generatedReadme: string | null;
//   generationState: GenerationState;
//   settingsContent: ReactNode;
// }

// export function ReadmeLayout({
//   activeTab,
//   setActiveTab,
//   readmeViewMode,
//   setReadmeViewMode,
//   repoPath,
//   version,
//   createdAt,
//   currentUrl,
//   generatedReadme,
//   generationState,
//   settingsContent,
// }: ReadmeLayoutProps) {
//   const router = useRouter();

//   return (
//     <div className="p-4 md:p-8">
//       <h1 className="mb-4 text-4xl font-bold">README Generator</h1>
//       <Tabs
//         value={activeTab}
//         onValueChange={(value) => setActiveTab(value as ActiveTab)}
//         className="space-y-6"
//       >
//         {activeTab === "readme" && (
//           <div className="mb-4">
//             <Button
//               variant="ghost"
//               onClick={async () => {
//                 router.push("/readme");
//               }}
//               className="gap-2"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back to settings
//             </Button>
//           </div>
//         )}

//         <TabsContent value="settings">{settingsContent}</TabsContent>

//         <TabsContent value="readme">
//           {generatedReadme && generationState === GenerationState.IDLE && (
//             <>
//               <ReadmeInfoCard
//                 repoPath={repoPath}
//                 version={version}
//                 createdAt={createdAt}
//                 currentUrl={currentUrl}
//               />
//               <GeneratedReadme
//                 content={generatedReadme}
//                 viewMode={readmeViewMode}
//                 setViewMode={setReadmeViewMode}
//                 generationState={generationState}
//               />
//             </>
//           )}
//           {generationState !== GenerationState.IDLE && (
//             <>
//               <ReadmeInfoCard
//                 repoPath={repoPath}
//                 version={version}
//                 createdAt={createdAt}
//                 currentUrl={currentUrl}
//               />
//               <GeneratedReadme
//                 content={generatedReadme ?? ""}
//                 viewMode={readmeViewMode}
//                 setViewMode={setReadmeViewMode}
//                 generationState={generationState}
//               />
//             </>
//           )}
//           {!generatedReadme && generationState === GenerationState.IDLE && (
//             <div className="text-center text-muted-foreground">
//               Generate a README first
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
