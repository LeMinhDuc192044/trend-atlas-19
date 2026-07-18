export function formatDomain(value: unknown) {
  if (value === 0 || value === "0" || value === "ComputerScience") return "Computer Science";
  if (value === 1 || value === "1" || value === "ArtificialIntelligence") return "Artificial Intelligence";

  return String(value ?? "Unknown domain")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}
