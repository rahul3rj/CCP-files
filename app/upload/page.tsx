"use client";

import { useRouter } from "next/navigation";
import { Upload } from "../components/Upload";

export default function UploadPage() {
  const router = useRouter();

  return (
    <Upload
      onNavigate={(page) => {
        if (page === "Home") router.push("/");
        else router.push(`/${page.toLowerCase().replace(" ", "-")}`);
      }}
    />
  );
}
