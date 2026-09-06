import { fileURLToPath } from "url";

import { headers as getHeaders } from "next/headers.js";
import Image from "next/image";
import { getPayload } from "payload";

import config from "@/payload.config";

export default async function HomePage() {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers });

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-between gap-10 p-11">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-favicon.svg"
            width={65}
          />
        </picture>
        <h1 className="text-4xl font-semibold tracking-tight">
          {user ? `Welcome back, ${user.email}` : "Welcome to your new project."}
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <a
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          <a
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <p>Update this page by editing</p>
        <a className="text-foreground underline underline-offset-4" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </div>
  );
}
