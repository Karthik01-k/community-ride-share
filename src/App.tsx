import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FindRides from "./pages/FindRides";
import PostRide from "./pages/PostRide";
import Profile from "./pages/Profile";
import TripDetail from "./pages/TripDetail";
import TrackRide from "./pages/TrackRide";
import Payment from "./pages/Payment";
import MyRides from "./pages/MyRides";
import Rewards from "./pages/Rewards";
import BecomeCaptain from "./pages/BecomeCaptain";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const wrap = (el: React.ReactNode) => <AppLayout>{el}</AppLayout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={wrap(<Landing />)} />
          <Route path="/dashboard" element={wrap(<Dashboard />)} />
          <Route path="/find-rides" element={wrap(<FindRides />)} />
          <Route path="/post-ride" element={wrap(<PostRide />)} />
          <Route path="/my-rides" element={wrap(<MyRides />)} />
          <Route path="/track" element={wrap(<TrackRide />)} />
          <Route path="/payment" element={wrap(<Payment />)} />
          <Route path="/rewards" element={wrap(<Rewards />)} />
          <Route path="/become-captain" element={wrap(<BecomeCaptain />)} />
          <Route path="/profile" element={wrap(<Profile />)} />
          <Route path="/trip/:id" element={wrap(<TripDetail />)} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
