export interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export interface RouteParams {
  [key: string]: string;
}
