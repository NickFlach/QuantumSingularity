import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SingularisDocumentation } from "@/components/SingularisDocumentation";

export default function DocumentationPage() {
  return (
    <div>
      <div className="container max-w-6xl py-4">
        <div className="flex justify-between items-center mb-6">
          <div></div> {/* Empty div for flex spacing */}
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} />
              Back to IDE
            </Button>
          </Link>
        </div>
      </div>
      <SingularisDocumentation />
    </div>
  );
}