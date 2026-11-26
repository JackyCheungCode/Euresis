"use client";

import React, { type ReactNode } from "react";
import {
  Button,
  Checkbox,
  IconButton,
  Link,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
} from "@carbon/react";
import {
  ArrowRight,
  ArrowUpRight,
  Close,
  Menu,
  Pause,
  Play,
  Search,
  Settings,
} from "@carbon/react/icons";

type LegacyEvent<T> = { detail: { value: T } };
const eventOf = <T,>(value: T) => ({ detail: { value } }) as LegacyEvent<T>;
const flattenText = (node: ReactNode): string =>
  React.Children.toArray(node).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    if (React.isValidElement<{ children?: ReactNode }>(child)) return flattenText(child.props.children);
    return "";
  }).join("");

const icons: Record<string, React.ComponentType<{ size?: number }>> = {
  "menu-lines": Menu, search: Search, close: Close, "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight, play: Play, pause: Pause, theme: Settings,
};

export function PButton({ children, variant, compact, hideLabel, icon, aria, ...props }: any) {
  const Icon = icon ? icons[icon] ?? ArrowRight : undefined;
  return <Button {...props} kind={variant === "secondary" ? "secondary" : "primary"} size={compact ? "sm" : "md"} renderIcon={Icon} hasIconOnly={hideLabel} iconDescription={aria?.["aria-label"] ?? flattenText(children)} aria-label={aria?.["aria-label"]}>{children}</Button>;
}
export function PButtonPure({ children, icon = "arrow-right", hideLabel, aria, ...props }: any) {
  const Icon = icons[icon] ?? ArrowRight;
  return <IconButton {...props} kind="ghost" size="lg" label={aria?.["aria-label"] ?? flattenText(children) ?? "Action"}>{<Icon size={20} />}</IconButton>;
}
export function PHeading({ children, tag = "h2", className, id, size, color, ...props }: any) {
  const Tag = tag;
  return <Tag id={id} className={["cds--type-heading-05", className].filter(Boolean).join(" ")} {...props}>{children}</Tag>;
}
export function PText({ children, className, size, color, ...props }: any) {
  return <p className={["cds--type-body-01", className].filter(Boolean).join(" ")} {...props}>{children}</p>;
}
export function PSelect({ label, name, value, onChange, children, disabled, ...props }: any) {
  const id = props.id ?? name;
  return <Select id={id} name={name} labelText={label} value={value ?? ""} disabled={disabled} onChange={(event) => onChange?.(eventOf(event.currentTarget.value))}>{children}</Select>;
}
export function PSelectOption({ value, children, ...props }: any) {
  return <SelectItem value={String(value)} text={flattenText(children)} {...props} />;
}
export function PInputText({ label, name, onChange, ...props }: any) {
  return <TextInput id={props.id ?? name} name={name} labelText={label} onChange={onChange ? (event) => onChange(eventOf(event.currentTarget.value)) : undefined} {...props} />;
}
export function PInputEmail({ label, name, onChange, ...props }: any) {
  return <TextInput id={props.id ?? name} name={name} type="email" labelText={label} onChange={onChange ? (event) => onChange(eventOf(event.currentTarget.value)) : undefined} {...props} />;
}
export function PTextarea({ label, name, onChange, ...props }: any) {
  return <TextArea id={props.id ?? name} name={name} labelText={label} onChange={onChange ? (event) => onChange(eventOf(event.currentTarget.value)) : undefined} {...props} />;
}
export function PIcon({ name, size = "md" }: any) {
  const Icon = icons[name] ?? Settings;
  return <Icon size={size === "xl" ? 32 : size === "sm" ? 16 : 24} />;
}
export function PLink({ children, href, icon, ...props }: any) {
  const Icon = icon ? icons[icon] ?? ArrowRight : undefined;
  return <Link href={href} renderIcon={Icon} {...props}>{children}</Link>;
}
export function PLinkPure({ children, ...props }: any) {
  return <Link {...props}>{children}</Link>;
}
export function PCheckbox({ label, name, ...props }: any) {
  return <Checkbox id={props.id ?? name} name={name} labelText={label} {...props} />;
}
export function PRadioGroup({ label, name, value, children, ...props }: any) {
  return <RadioButtonGroup legendText={label} name={name} valueSelected={value} {...props}>{children}</RadioButtonGroup>;
}
export function PRadioGroupOption({ value, label }: any) {
  return <RadioButton id={String(value)} value={value} labelText={label} />;
}
export function PSegmentedControl({ label, name, value, children, onChange, ...props }: any) {
  return <div className="euresis-segmented-control"><span className="cds--label">{label}</span><ToggleGroup name={name} value={value} onChange={(_name, selected) => onChange?.(eventOf(selected))} {...props}>{children}</ToggleGroup></div>;
}
export function PSegmentedControlItem({ value, children }: any) {
  return <ToggleGroupItem id={String(value)} value={value} text={flattenText(children)} />;
}

export function PDivider() { return <hr className="euresis-carbon-divider" />; }
