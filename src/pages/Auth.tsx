
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { User, Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn, signUp } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  
  // Reset form when switching modes
  useEffect(() => {
    reset();
  }, [mode, reset]);
  
  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" />;
  }
  
  const onSubmit = async (data: any) => {
    try {
      if (mode === "login") {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password, data.username);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-darker py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <a href="/" className="text-4xl font-bold tracking-wider text-game-orange text-glow inline-block mb-2">
            UseTheKnife.com
          </a>
          <h2 className="text-xl text-gray-400">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>
        
        <Card className="bg-game-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {mode === "login" 
                ? "Enter your credentials to access your account" 
                : "Fill in your details to create an account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <label htmlFor="username" className="text-sm text-gray-300">
                      Username
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="Your username"
                      className="bg-game-gray/30 border-white/10 text-white"
                      {...register("username", {
                        required: "Username is required",
                      })}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.username.message as string}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <label htmlFor="email" className="text-sm text-gray-300">
                    Email
                  </label>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="bg-game-gray/30 border-white/10 text-white"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <label htmlFor="password" className="text-sm text-gray-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-game-gray/30 border-white/10 text-white pr-10"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.password.message as string}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-game-orange hover:bg-game-orange/80 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-white/10 pt-4">
            <p className="text-sm text-gray-400">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-game-orange hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-game-orange">
            Return to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
