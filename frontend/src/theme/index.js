import { extendTheme } from "@chakra-ui/react";

export const customTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    // Modern gradient-friendly color palette
    brand: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    // Fallback colors in case custom colors fail
    fallback: {
      primary: "#0ea5e9",
      secondary: "#a855f7",
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
    },
    // Glassmorphism colors
    glass: {
      50: "rgba(255, 255, 255, 0.1)",
      100: "rgba(255, 255, 255, 0.2)",
      200: "rgba(255, 255, 255, 0.3)",
      300: "rgba(255, 255, 255, 0.4)",
      400: "rgba(255, 255, 255, 0.5)",
      500: "rgba(255, 255, 255, 0.6)",
      600: "rgba(255, 255, 255, 0.7)",
      700: "rgba(255, 255, 255, 0.8)",
      800: "rgba(255, 255, 255, 0.9)",
      900: "rgba(255, 255, 255, 1)",
    },
    // Dark glassmorphism
    darkGlass: {
      50: "rgba(0, 0, 0, 0.1)",
      100: "rgba(0, 0, 0, 0.2)",
      200: "rgba(0, 0, 0, 0.3)",
      300: "rgba(0, 0, 0, 0.4)",
      400: "rgba(0, 0, 0, 0.5)",
      500: "rgba(0, 0, 0, 0.6)",
      600: "rgba(0, 0, 0, 0.7)",
      700: "rgba(0, 0, 0, 0.8)",
      800: "rgba(0, 0, 0, 0.9)",
      900: "rgba(0, 0, 0, 1)",
    },
    // Neon accent colors
    neon: {
      blue: "#00d4ff",
      purple: "#a855f7",
      pink: "#ec4899",
      green: "#10b981",
      orange: "#f59e0b",
      red: "#ef4444",
    },
    // Gradient backgrounds
    gradients: {
      primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      warning: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      danger: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      dark: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      glass: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
      glassDark: "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)",
    }
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  },
  space: {
    px: "1px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },
  sizes: {
    max: "max-content",
    min: "min-content",
    full: "100%",
    "3xs": "14rem",
    "2xs": "16rem",
    xs: "20rem",
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem",
    "2xl": "42rem",
    "3xl": "48rem",
    "4xl": "56rem",
    "5xl": "64rem",
    "6xl": "72rem",
    "7xl": "80rem",
    "8xl": "90rem",
    container: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
  radii: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  shadows: {
    // 3D shadows
    "3d-sm": "0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    "3d-md": "0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
    "3d-lg": "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
    "3d-xl": "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
    "3d-2xl": "0 25px 50px rgba(0,0,0,0.25)",
    // Glassmorphism shadows
    glass: "0 8px 32px rgba(31, 38, 135, 0.37)",
    glassDark: "0 8px 32px rgba(0, 0, 0, 0.37)",
    // Neon glow effects
    "neon-blue": "0 0 20px rgba(0, 212, 255, 0.5)",
    "neon-purple": "0 0 20px rgba(168, 85, 247, 0.5)",
    "neon-pink": "0 0 20px rgba(236, 72, 153, 0.5)",
    "neon-green": "0 0 20px rgba(16, 185, 129, 0.5)",
    // Hover effects
    "hover-3d": "0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)",
    "hover-glass": "0 15px 45px rgba(31, 38, 135, 0.5)",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "xl",
        _focus: {
          boxShadow: "outline",
        },
      },
      variants: {
        // 3D Button variants
        "3d": {
          bg: "white",
          color: "gray.800",
          boxShadow: "3d-md",
          border: "1px solid",
          borderColor: "gray.200",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: "hover-3d",
          },
          _active: {
            transform: "translateY(0px)",
            boxShadow: "3d-sm",
          },
        },
        "3d-primary": {
          bg: "gradients.primary",
          color: "white",
          boxShadow: "3d-md",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: "hover-3d",
          },
          _active: {
            transform: "translateY(0px)",
            boxShadow: "3d-sm",
          },
        },
        "glass": {
          bg: "glass.200",
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: "glass.300",
          color: "gray.800",
          _hover: {
            bg: "glass.300",
            transform: "translateY(-1px)",
            boxShadow: "hover-glass",
          },
        },
        "neon": {
          bg: "transparent",
          border: "2px solid",
          borderColor: "neon.blue",
          color: "neon.blue",
          boxShadow: "neon-blue",
          _hover: {
            bg: "neon.blue",
            color: "white",
            boxShadow: "neon-blue",
            transform: "scale(1.05)",
          },
        },
      },
      defaultProps: {
        variant: "3d",
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          borderRadius: "2xl",
          boxShadow: "3d-lg",
          border: "1px solid",
          borderColor: "gray.100",
          overflow: "hidden",
        },
      },
      variants: {
        "3d": {
          container: {
            bg: "white",
            borderRadius: "2xl",
            boxShadow: "3d-lg",
            border: "1px solid",
            borderColor: "gray.100",
            _hover: {
              transform: "translateY(-4px)",
              boxShadow: "hover-3d",
            },
          },
        },
        "glass": {
          container: {
            bg: "glass.200",
            backdropFilter: "blur(20px)",
            border: "1px solid",
            borderColor: "glass.300",
            boxShadow: "glass",
            _hover: {
              bg: "glass.300",
              boxShadow: "hover-glass",
            },
          },
        },
        "gradient": {
          container: {
            bg: "gradients.primary",
            color: "white",
            boxShadow: "3d-xl",
            _hover: {
              transform: "translateY(-4px)",
              boxShadow: "hover-3d",
            },
          },
        },
      },
      defaultProps: {
        variant: "3d",
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "xl",
          border: "2px solid",
          borderColor: "gray.200",
          _focus: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          },
        },
      },
      variants: {
        "glass": {
          field: {
            bg: "glass.100",
            backdropFilter: "blur(10px)",
            border: "1px solid",
            borderColor: "glass.200",
            _focus: {
              bg: "glass.200",
              borderColor: "neon.blue",
              boxShadow: "neon-blue",
            },
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "semibold",
        textTransform: "uppercase",
        letterSpacing: "wider",
      },
      variants: {
        "3d": {
          boxShadow: "3d-sm",
          border: "1px solid",
          borderColor: "current",
        },
        "neon": {
          bg: "transparent",
          border: "1px solid",
          borderColor: "neon.blue",
          color: "neon.blue",
          boxShadow: "neon-blue",
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
        fontFamily: "body",
        lineHeight: "base",
      },
      "*::placeholder": {
        color: "gray.400",
      },
      "*, *::before, *::after": {
        borderColor: "gray.200",
      },
    },
  },
});
