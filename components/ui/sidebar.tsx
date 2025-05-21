"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// Constants
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Context
interface SidebarContextValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

// Provider
interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  ...props
}: SidebarProviderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [openMobile, setOpenMobile] = React.useState(false);
  const [open, _setOpen] = React.useState(defaultOpen);

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );

  const state = React.useMemo(() => (open ? "expanded" : "collapsed"), [open]);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile, setOpen]);

  // Handle keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        state,
        open: openProp !== undefined ? openProp : open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <div
        className={cn("flex", className)}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// Hook
export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// Components
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export function Sidebar({
  children,
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  ...props
}: SidebarProps) {
  const { state, open, openMobile, isMobile } = useSidebar();

  return (
    <div
      data-state={state}
      data-side={side}
      data-variant={variant}
      data-collapsible={collapsible}
      data-open={openMobile ? "true" : "false"}
      className={cn(
        "group/sidebar relative z-10 flex flex-col text-sidebar-foreground",
        variant === "inset" && "h-full",
        variant === "sidebar" &&
          "border-r border-sidebar-border bg-sidebar-background",
        variant === "floating" &&
          "m-4 h-[calc(100%-2rem)] rounded-lg border border-sidebar-border bg-sidebar-background shadow-lg",
        collapsible === "icon" &&
          !isMobile &&
          (open
            ? "w-[--sidebar-width]"
            : "w-[var(--collapsed-width)] [--collapsed-width:4rem]"),
        collapsible === "offcanvas" &&
          !isMobile &&
          (open ? "w-[--sidebar-width]" : "w-0"),
        collapsible === "none" && "w-[--sidebar-width]",
        isMobile && "fixed inset-y-0 w-[--sidebar-width-mobile]",
        isMobile && !openMobile && "translate-x-[-100%]",
        isMobile && "transition-transform duration-300 ease-in-out",
        side === "right" && "right-0",
        side === "left" && "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-14 items-center border-b border-sidebar-border px-4",
        className
      )}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center border-t border-sidebar-border px-2 py-4",
        className
      )}
      {...props}
    />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)} {...props} />
  );
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 pb-4", className)} {...props} />;
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center justify-between px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function SidebarGroupAction({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
}

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return (
    <div className={cn("group/menu-item relative", className)} {...props} />
  );
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export function SidebarMenuButton({
  className,
  isActive,
  ...props
}: SidebarMenuButtonProps) {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <button
      data-active={isActive || undefined}
      className={cn(
        "peer/menu-button group/menu-button relative flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
        "group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:justify-center",
        isActive &&
          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuAction({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md opacity-0 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:opacity-100 group-hover/menu-item:opacity-100",
        "group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:hidden",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuSub({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "ml-4 space-y-1 border-l border-sidebar-border pl-3",
        "group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:ml-0 group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:border-l-0 group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:pl-0",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative", className)} {...props} />;
}

interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export function SidebarMenuSubButton({
  className,
  isActive,
  ...props
}: SidebarMenuSubButtonProps) {
  return (
    <button
      data-active={isActive || undefined}
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
        isActive &&
          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-sidebar-primary px-1.5 py-0.5 text-xs font-medium text-sidebar-primary-foreground",
        "group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:right-1/2 group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:translate-x-1/2 group-data-[collapsible=icon]/sidebar:data-[state=collapsed]:-translate-y-1/2",
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuSkeleton({
  className,
  showIcon = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full animate-pulse items-center rounded-md px-3 py-2",
        className
      )}
      {...props}
    >
      {showIcon && (
        <div className="mr-2 h-4 w-4 rounded-full bg-sidebar-accent" />
      )}
      <div className="h-4 w-full rounded-md bg-sidebar-accent" />
    </div>
  );
}

export function SidebarSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-4 my-2 h-px bg-sidebar-border", className)}
      {...props}
    />
  );
}

export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={toggleSidebar}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="9" x2="15" y1="3" y2="3" />
        <line x1="3" x2="9" y1="9" y2="9" />
        <line x1="3" x2="9" y1="15" y2="15" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

export function SidebarRail({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { toggleSidebar } = useSidebar();

  return (
    <div
      className={cn(
        "absolute right-0 top-0 z-20 h-full w-1.5 translate-x-1/2 cursor-col-resize bg-transparent transition-all hover:bg-sidebar-primary",
        className
      )}
      onClick={toggleSidebar}
      {...props}
    />
  );
}

export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { state, open, openMobile, isMobile } = useSidebar();

  return (
    <div
      className={cn(
        "flex-1 transition-[margin]",
        state === "expanded" && "ml-[--sidebar-width]",
        state === "collapsed" && "ml-[var(--collapsed-width)]",
        isMobile && "ml-0",
        className
      )}
      {...props}
    />
  );
}
