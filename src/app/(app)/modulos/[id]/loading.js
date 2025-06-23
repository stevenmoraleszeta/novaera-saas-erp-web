import React from "react";
import MainContent from "@/components/MainContent";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <MainContent>
      <div className="max-w-full mx-auto my-8 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        {/* Module Header */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200">
          {/* Module Icon Skeleton */}
          <Skeleton className="w-16 h-16 rounded-lg" />

          {/* Module Info */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        {/* Module Content */}
        <div className="space-y-4">
          {/* Section Title */}
          <Skeleton className="h-5 w-44" />

          {/* Table Skeleton */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="p-3">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="p-3">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="p-3">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="bg-white">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="p-3">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="p-3">
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="p-3">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
