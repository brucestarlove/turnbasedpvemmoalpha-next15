import Link from "next/link";

import { AuthControls } from "@/components/auth-controls";
import { Icons } from "@/components/icons";
import { StripeButton } from "@/components/stripe-button";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";

const HomePage = async () => {
  const session = await auth();

  return (
    <>
      <header className="border-border/40 bg-background/80 w-full border-b backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="#" className="text-starlight font-mono text-lg font-bold">
            Starscape
          </Link>
          <div className="flex items-center gap-2">
            <AuthControls session={session} />
          </div>
        </div>
      </header>
      <section className="container mt-10 flex flex-col items-center gap-3 text-center md:absolute md:top-1/2 md:left-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
        <h1 className="mb-1 font-mono text-4xl leading-tight font-extrabold tracking-tighter [word-spacing:-0.5rem] md:text-5xl">
          <span className="text-starlight">Turn-based PvE MMO</span> alpha
        </h1>
        <p className="text-muted-foreground max-w-2xl md:text-lg">
          game experiment with my Next15 template
        </p>
        <div className="mt-2 flex gap-4">
          {session ? (
            <>
              <Link
                href="/game"
                className={buttonVariants({ variant: "starlight", size: "lg" })}
              >
                <Icons.play className="mr-2 h-4 w-4" />
                Play Game
              </Link>
              <StripeButton />
            </>
          ) : // Play button commented out when not logged in
          // <Link
          //   href=""
          //   target="_blank"
          //   className={buttonVariants({ variant: "starlight", size: "lg" })}
          // >
          //   {t("playButton")}
          // </Link>
          null}
          <Link
            href="/about"
            className={buttonVariants({ variant: "glass", size: "lg" })}
          >
            <Icons.info /> About
          </Link>
        </div>
      </section>
      <footer className="text-muted-foreground absolute bottom-3 w-full text-center text-sm">
        © {new Date().getFullYear()}{" "}
        <Link
          href="starlove.world"
          className={buttonVariants({
            variant: "link",
            className: "text-starlight hover:text-cosmic-bloom !p-0",
          })}
        >
          Starlove
        </Link>
      </footer>
    </>
  );
};

export default HomePage;
