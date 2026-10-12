export function bolehMuatUlangPembaruan({ kuisBerjalan, pembaruanTersedia }: { kuisBerjalan: boolean; pembaruanTersedia: boolean }): boolean {
  return pembaruanTersedia && !kuisBerjalan;
}
