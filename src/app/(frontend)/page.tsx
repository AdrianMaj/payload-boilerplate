import Link from "next/link";

import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary">
      <h1 className="mx-auto text-secondary">Welcome to PayloadCMS Boilerplate!</h1>
      <Button asChild variant="secondary">
        <Link href="/admin">Go to Admin</Link>
      </Button>
    </section>
  );
};

export default HomePage;
