// Allows importing JSON files directly in TypeScript
declare module "*.json" {
  const value: any;
  export default value;
}
