declare module "zipcodes" {
  interface ZipRow {
    zip: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  }
  export function lookup(zip: string): ZipRow | undefined;
}
