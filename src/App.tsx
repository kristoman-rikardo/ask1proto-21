import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, MemoryRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import IframeReceiver from "./components/IframeReceiver";

const queryClient = new QueryClient();

interface AppProps {
  apiEndpoint: string;
  onClose?: () => void;
  onMaximize?: () => void;
}

export const App = ({ apiEndpoint, onClose, onMaximize }: AppProps) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IframeReceiver>
          <Toaster />
          <Sonner />
          <MemoryRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MemoryRouter>
        </IframeReceiver>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// export const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <IframeReceiver>
//         <Toaster />
//         <Sonner />
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Index />} />
//             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </IframeReceiver>
//     </TooltipProvider>
//   </QueryClientProvider>
// );
