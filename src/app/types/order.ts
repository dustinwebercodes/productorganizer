export interface ProductSpecs {
  burnPad: {
    baseColor: string;
    corduraColor: string;
    logoColor: string;
  };
  foamPad: {
    baseColor: string;
    seatColor: string;
    trimColor: string;
    pipingColor: string;
    wearLeatherColor: string;
    logoColor: string;
  };
  bandageHolder: {
    baseColor: string;
    logoColor: string;
    grommetColor: string;
  };
  paddockBag: {
    baseColor: string;
    handleColor: string;
    logoColor: string;
  };
  schoolingPad: {
    baseColor: string;
    pipingColor: string;
    logoColor: string;
  };
  raincover: {
    baseColor: string;
    logoColor: string;
  };
  blanket: {
    type: string;
    baseColor: string;
    trimColor: string;
    logoColor: string;
  };
  saddle: {
    type: string;
    baseColor: string;
    stitchColor: string;
    topAccentColor: string;
    bottomAccentColor: string;
  };
}

export interface ProductTemplate {
  id: string;
  name: string;
  specs: string[];
  sortOrder: number;
}

export interface ProductTemplates {
  [key: string]: ProductTemplate;
}

export interface Product {
  name: string;
  quantity: number;
  selected: boolean;
  specs?: Partial<ProductSpecs[keyof ProductSpecs]>;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  products: Record<string, Product>;
  status: 'open' | 'completed' | 'archived';
  cartNumber?: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
} 