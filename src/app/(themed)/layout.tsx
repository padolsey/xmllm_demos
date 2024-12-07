// This is a route group layout that will apply the theme provider
import ThemeProvider from "../theme-provider";

export default function ThemedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider showToggle={true}>
      {children}
    </ThemeProvider>
  );
} 