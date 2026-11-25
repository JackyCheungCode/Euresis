import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
type Variant = "primary" | "secondary" | "text";
type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; children: ReactNode };
type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode };
export function LinkButton({ variant = "primary", className = "", children, ...props }: LinkProps) {
  return <a className={("button button-" + variant + " " + className).trim()} {...props}>{children}</a>;
}
export function ActionButton({ variant = "primary", className = "", children, ...props }: ActionProps) {
  return <button className={("button button-" + variant + " " + className).trim()} {...props}>{children}</button>;
}
