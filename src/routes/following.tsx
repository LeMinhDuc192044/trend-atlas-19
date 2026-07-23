// import { createFileRoute, Link } from "@tanstack/react-router";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { BellRing, BookOpen, LogIn, Newspaper, Trash2 } from "lucide-react";
// import { toast } from "sonner";
// import { followSubscriptionService } from "@/api/services";
// import { AppShell } from "@/components/app-shell";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useAuth } from "@/lib/auth";

// export const Route = createFileRoute("/following")({ component: Following });

// function Following() {
//   const { user, authLoading } = useAuth();
//   const queryClient = useQueryClient();
//   const follows = useQuery({
//     queryKey: ["follow-subscriptions"],
//     queryFn: () => followSubscriptionService.listMine(),
//     enabled: Boolean(user),
//     retry: false,
//   });
//   const unfollow = useMutation({
//     mutationFn: followSubscriptionService.unfollow,
//     onSuccess: async () => {
//       toast.success("Unfollowed successfully");
//       await queryClient.invalidateQueries({ queryKey: ["follow-subscriptions"] });
//     },
//     onError: (error) => toast.error(error.message),
//   });

//   return (
//     <AppShell>
//       <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5 md:p-8">
//         <div>
//           <h1 className="font-serif text-4xl">Following</h1>
//           <p className="mt-1 text-sm text-muted-foreground">
//             Journals and topics that can trigger new-paper notifications.
//           </p>
//         </div>
//         {authLoading ? (
//           <Skeleton className="h-28 rounded-xl" />
//         ) : !user ? (
//           <Alert>
//             <LogIn />
//             <AlertTitle>Sign in required</AlertTitle>
//             <AlertDescription>
//               <Link to="/auth" className="font-medium text-brand hover:underline">
//                 Sign in
//               </Link>{" "}
//               to manage your follows.
//             </AlertDescription>
//           </Alert>
//         ) : follows.isLoading ? (
//           Array.from({ length: 3 }, (_, index) => (
//             <Skeleton key={index} className="h-24 rounded-xl" />
//           ))
//         ) : follows.error ? (
//           <Alert variant="destructive">
//             <AlertTitle>Could not load follows</AlertTitle>
//             <AlertDescription>{follows.error.message}</AlertDescription>
//           </Alert>
//         ) : follows.data?.items.length ? (
//           <div className="flex flex-col gap-3">
//             {follows.data.items.map((item) => {
//               const isJournal = item.targetType === "Journal";
//               return (
//                 <Card key={item.id} className="flex items-center gap-4 p-5">
//                   <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-brand">
//                     {isJournal ? <Newspaper /> : <BookOpen />}
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
//                       {isJournal ? "Journal" : "Research topic"}
//                     </p>
//                     <Link
//                       to={isJournal ? "/journals/$id" : "/topics/$id"}
//                       params={{ id: item.targetId }}
//                       className="font-semibold hover:text-brand"
//                     >
//                       {item.targetName}
//                     </Link>
//                   </div>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     disabled={unfollow.isPending}
//                     onClick={() => unfollow.mutate(item.id)}
//                   >
//                     <Trash2 data-icon="inline-start" /> Unfollow
//                   </Button>
//                 </Card>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="py-16 text-center text-sm text-muted-foreground">
//             <BellRing className="mx-auto mb-3" /> You are not following anything yet.
//           </div>
//         )}
//       </div>
//     </AppShell>
//   );
// }
