"use client";

import Image from "next/image";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type AuthControlsProps = {
  session: Session | null;
};

export const AuthControls = ({ session }: AuthControlsProps) => {
  const t = useTranslations("home");

  if (!session)
    return (
      <Button
        variant="starlight"
        className="cursor-pointer"
        onClick={async () => await signIn("github")}
      >
        {t("signIn")}
      </Button>
    );

  const { user } = session;

  return (
    <>
      <Image
        className="border-primary/20 overflow-hidden rounded-full border-2"
        src={`${user?.image}`}
        alt={`${user?.name}`}
        width={32}
        height={32}
      />
      <Button
        variant="glass"
        className="cursor-pointer"
        onClick={async () => await signOut()}
      >
        {t("signOut")}
      </Button>
    </>
  );
};
