export interface Ubigeo {
  code: string; // "150118"
  department: string; // "LIMA"
  province: string; // "LIMA"
  district: string; // "MIRAFLORES"
  departmentCode: string; // "15"
  provinceCode: string; // "1501"
  reniecCode?: string;
  fullName?: string;
}

export interface DepartmentItem {
  departmentCode: string;
  department: string;
}

export interface ProvinceItem {
  provinceCode: string;
  province: string;
  departmentCode: string;
}

export interface DistrictItem {
  code: string;
  district: string;
  provinceCode: string;
  departmentCode: string;
}
