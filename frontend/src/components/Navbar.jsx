import { useState } from "react";
import { NavLink } from "react-router";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "../assets/logo.svg";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/courses", label: "Courses" },
];

function linkClass({ isActive }) {
  return [
    "no-underline transition-colors duration-150",
    isActive
      ? "text-linkedin-blue underline decoration-linkedin-blue underline-offset-4"
      : "text-linkedin-body hover:text-linkedin-blue hover:underline hover:decoration-linkedin-blue hover:underline-offset-4",
  ].join(" ");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-linkedin-white border-b border-linkedin-border">
      {/* Desktop bar */}
      <div className="h-13 flex items-center justify-between px-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center shrink-0">
          <img src={logo} alt="Questify" className="h-8 w-auto object-contain" />
        </NavLink>

        {/* Nav links — md and above */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                style={{ fontSize: "15px", fontWeight: 600 }}
                className={linkClass}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sign In — md and above */}
        <button
          style={{ borderRadius: "2px" }}
          className="
            hidden md:inline-flex items-center
            px-4 py-1.5 text-sm font-bold
            border border-linkedin-blue text-linkedin-blue
            bg-transparent cursor-pointer transition-colors duration-150
            hover:bg-linkedin-blue hover:text-linkedin-white
          "
        >
          Sign In
        </button>

        {/* Hamburger — small screens only */}
        <button
          className="md:hidden flex items-center justify-center text-linkedin-body hover:text-linkedin-blue transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-linkedin-white border-t border-linkedin-border px-6 py-4 flex flex-col gap-4">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              style={{ fontSize: "15px", fontWeight: 600 }}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}

          <button
            style={{ borderRadius: "2px", alignSelf: "flex-start" }}
            className="
              mt-2 px-4 py-1.5 text-sm font-bold
              border border-linkedin-blue text-linkedin-blue
              bg-transparent cursor-pointer transition-colors duration-150
              hover:bg-linkedin-blue hover:text-linkedin-white
            "
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
}
