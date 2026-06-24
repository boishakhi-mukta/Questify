import { SignIn } from "@clerk/nextjs";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import Image from "next/image";

const clerkAppearance = {
  variables: {
    colorPrimary:       "#0A66C2",
    colorBackground:    "#FFFFFF",
    colorText:          "#1D2226",
    colorTextSecondary: "#434649",
    colorInputBackground: "#FFFFFF",
    colorInputText:     "#1D2226",
    colorDanger:        "#DC2626",
    borderRadius:       "8px",
    fontFamily:         "'Source Sans 3', system-ui, sans-serif",
    fontSizeBase:       "15px",
    fontWeight: { bold: 700, medium: 600, normal: 400 } as const,
  },
  elements: {
    // Remove Clerk's outer shadow so our card wrapper controls it
    card:                  "shadow-[0_4px_32px_rgba(0,0,0,0.10)] rounded-xl",
    headerTitle:           "font-bold text-brand-dark",
    formButtonPrimary:     "bg-[#0A66C2] hover:bg-[#004182] focus:ring-[#0A66C2]",
    footerActionLink:      "text-[#0A66C2] hover:text-[#004182]",
    identityPreviewEditButton: "text-[#0A66C2]",
  },
} as const;

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Logo */}
      <div className="px-7 py-5">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="Questify"
            width={120}
            height={30}
            className="h-[30px] w-auto"
          />
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-10">

          {/* Left — Lottie */}
          <div className="flex-1 hidden md:flex items-center justify-center">
            <DotLottieReact
              src="/Educatin.lottie"
              loop
              autoplay
              className="w-full max-w-[460px]"
            />
          </div>

          {/* Right — Clerk SignIn */}
          <div className="flex-1 flex justify-center">
            <SignIn appearance={clerkAppearance} />
          </div>

        </div>
      </div>
    </div>
  );
}
