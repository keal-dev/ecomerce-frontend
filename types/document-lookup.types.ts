export interface DniLookupResult {
  type: 'DNI';
  documentNumber: string;
  fullName: string;
  firstName: string;
  firstLastName: string;
  secondLastName: string;
}

export interface RucLookupResult {
  type: 'RUC';
  documentNumber: string;
  legalName: string;
  status: string;
  condition: string;
  address: string;
  department: string;
  province: string;
  district: string;
}
