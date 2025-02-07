'use client';

import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = {
  Product: [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#integrations", label: "Integrations" },
    { href: "#changelog", label: "Changelog" },
  ],
  Resources: [
    { href: "#docs", label: "Documentation" },
    { href: "#guides", label: "Guides" },
    { href: "#api", label: "API Reference" },
    { href: "#status", label: "Status" },
  ],
  Company: [
    { href: "#about", label: "About" },
    { href: "#blog", label: "Blog" },
    { href: "#careers", label: "Careers" },
    { href: "#contact", label: "Contact" },
  ],
  Legal: [
    { href: "#privacy", label: "Privacy" },
    { href: "#terms", label: "Terms" },
    { href: "#security", label: "Security" },
    { href: "#cookies", label: "Cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {Object.entries(footerLinks).map(([title, links], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Moxium. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="#twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </Link>
              <Link href="#linkedin" className="text-muted-foreground hover:text-foreground transition-colors">
                LinkedIn
              </Link>
              <Link href="#github" className="text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
