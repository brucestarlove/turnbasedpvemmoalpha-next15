import Link from "next/link";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";

const AboutPage = () => {
  return (
    <>
      <header className="border-border/40 bg-background/80 w-full border-b backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-starlight font-mono text-lg font-bold">
            Starscape
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "glass", size: "sm" })}
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <section className="mb-16 text-center">
            <h1 className="text-starlight mb-6 font-mono text-4xl font-extrabold tracking-tighter md:text-5xl">
              About Starscape
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              A turn-based PvE MMO idea (a very large one I can only convey one
              tiny step at a time).
            </p>
          </section>

          <div className="grid gap-12 md:grid-cols-2">
            <section className="space-y-6">
              <h2 className="text-foreground text-2xl font-bold">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                vision statement.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I&apos;m a lil passionate about this idea to create immersive
                experiences that bring players together in a shared universe of
                exploration and discovery.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-foreground text-2xl font-bold">
                Key Features
              </h2>
              <ul className="text-muted-foreground space-y-4">
                <li className="flex items-start gap-3">
                  <Icons.check className="text-starlight mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>All actions turn-based with timer</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.check className="text-starlight mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>Persistent multiplayer world, co-build the town</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.check className="text-starlight mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>Character progression and customization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.check className="text-starlight mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>Multiplayer PvE experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.check className="text-starlight mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>Craft and Trade</span>
                </li>
              </ul>
            </section>
          </div>

          <section className="mt-16 text-center">
            <h2 className="text-foreground mb-6 text-2xl font-bold">
              Join the Adventure
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl">
              giga early alpha, want to join? Sign in (via GitHub) to start
              playing and experience the universe of Starscape.
            </p>
            <Link
              href="/"
              className={buttonVariants({ variant: "starlight", size: "lg" })}
            >
              <Icons.play className="mr-2 h-4 w-4" />
              Start Your Journey
            </Link>
          </section>
        </div>
      </main>

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

export default AboutPage;
