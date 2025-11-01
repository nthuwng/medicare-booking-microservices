import { Link } from "react-router-dom";
import { useCurrentApp } from "@/components/contexts/app.context";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

interface LayoutAccountHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

const LayoutAccountHeader: React.FC<LayoutAccountHeaderProps> = ({
  title,
  breadcrumbs = [],
}) => {
  const { theme } = useCurrentApp();

  return (
    <div
      className="w-full h-37 transition"
      style={
        theme === "dark"
          ? {
              background: "#0D1224",
            }
          : {
              backgroundImage: `
          linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
          radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
          radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
        `,
              backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
            }
      }
    >
      <div className="w-[90%] mx-auto py-6 text-center">
        {breadcrumbs.length > 0 && (
          <nav
            className={`text-[15px] flex items-center justify-center transition ${
              theme === "dark" ? "text-gray-400" : "text-slate-500"
            }`}
          >
            {breadcrumbs.map((bc, idx) => (
              <span key={idx}>
                {bc.to ? (
                  <Link
                    to={bc.to}
                    className={`inline-block align-middle transition ${
                      theme === "dark"
                        ? "hover:text-blue-400"
                        : "hover:text-slate-700"
                    }`}
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span className="inline-block align-middle">{bc.label}</span>
                )}

                {idx < breadcrumbs.length - 1 && (
                  <span
                    className={`mx-2 transition ${
                      theme === "dark" ? "text-gray-600" : "text-slate-400"
                    }`}
                  >
                    ›
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1
          className={`m-0 mt-2 text-3xl md:text-4xl font-bold text-center transition ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          {title}
        </h1>
      </div>
    </div>
  );
};

export default LayoutAccountHeader;
