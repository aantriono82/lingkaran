function angka(nilai: number, desimal = 1): string {
  return Number.isFinite(nilai) ? nilai.toFixed(desimal).replace('.', ',') : 'belum tersedia';
}

export interface UnsurDescriptionState { radius?: number; sudutA?: number; sudutB?: number }
export function describeUnsur(state: UnsurDescriptionState): string {
  return `Lingkaran berjari-jari ${angka(state.radius ?? 0)} satuan. Titik A dan B berada pada keliling; sudut posisi A ${angka((state.sudutA ?? 0) * 180 / Math.PI)} derajat dan B ${angka((state.sudutB ?? 0) * 180 / Math.PI)} derajat.`;
}

export interface KelilingDescriptionState { radius?: number; keliling?: number; kemajuan?: number; mode?: string }
export function describeKeliling(state: KelilingDescriptionState): string {
  return `Eksplorasi ${state.mode ?? 'keliling'}. Jari-jari ${angka(state.radius ?? 0)} cm, keliling ${angka(state.keliling ?? 0, 2)} cm${state.kemajuan === undefined ? '' : `, busur terbuka ${angka(state.kemajuan, 0)} persen`}.`;
}

export interface LuasDescriptionState { radius?: number; jumlahJuring?: number; luas?: number }
export function describeLuas(state: LuasDescriptionState): string {
  return `Lingkaran berjari-jari ${angka(state.radius ?? 0)} cm dibagi menjadi ${angka(state.jumlahJuring ?? 0, 0)} juring. Luasnya ${angka(state.luas ?? 0, 2)} cm persegi.`;
}

export interface SudutDescriptionState { sudutPusat?: number; sudutKeliling?: number; sudutKelilingD?: number }
export function describeSudut(state: SudutDescriptionState): string {
  return `Sudut pusat ${angka(state.sudutPusat ?? 0)} derajat dan sudut keliling ${angka(state.sudutKeliling ?? 0)} derajat. Hubungannya: sudut pusat dua kali sudut keliling${state.sudutKelilingD === undefined ? '' : `; sudut pembanding ${angka(state.sudutKelilingD)} derajat`}.`;
}

export interface TaliBusurDescriptionState { sudut?: number; mode?: string }
export function describeTaliBusur(state: TaliBusurDescriptionState): string {
  return `Sudut antara dua tali busur pada mode ${state.mode ?? 'eksplorasi'} adalah ${angka(state.sudut ?? 0)} derajat.`;
}

export interface SegiEmpatDescriptionState { jumlahSudut?: number; mode?: string }
export function describeSegiEmpat(state: SegiEmpatDescriptionState): string {
  return `Segi empat tali busur pada mode ${state.mode ?? 'lingkaran'}. Jumlah sudut berhadapan saat ini ${angka(state.jumlahSudut ?? 0)} derajat.`;
}

export interface DalamDescriptionState { radius?: number; valid?: boolean }
export function describeDalam(state: DalamDescriptionState): string {
  return `Lingkaran dalam segitiga ${state.valid ? 'terdefinisi' : 'belum terdefinisi'} dengan jari-jari ${angka(state.radius ?? 0)} satuan.`;
}

export interface LuarDescriptionState { radius?: number; valid?: boolean; letak?: string }
export function describeLuar(state: LuarDescriptionState): string {
  return `Lingkaran luar segitiga ${state.valid ? 'terdefinisi' : 'belum terdefinisi'} dengan jari-jari ${angka(state.radius ?? 0)} satuan${state.letak ? `; pusat berada ${state.letak}` : ''}.`;
}

export interface SinggungDescriptionState { mode?: string; sudut?: number; jarak?: number; jumlahGaris?: number }
export function describeSinggung(state: SinggungDescriptionState): string {
  const bagian = state.mode === 'pada-lingkaran' && state.sudut !== undefined
    ? `posisi titik singgung ${angka(state.sudut)} derajat`
    : state.mode === 'dua-lingkaran' && state.jarak !== undefined
      ? `jarak pusat ${angka(state.jarak)} satuan dan ${state.jumlahGaris ?? 0} garis terlihat`
      : 'titik luar dan garis singgung';
  return `Eksplorasi ${bagian}. Jari-jari selalu tegak lurus garis singgung di titik singgung.`;
}

export interface KedudukanDescriptionState { jarak?: number; radiusA?: number; radiusB?: number; kedudukan?: string }
export function describeKedudukan(state: KedudukanDescriptionState): string {
  return `Dua lingkaran berjari-jari ${angka(state.radiusA ?? 0)} dan ${angka(state.radiusB ?? 0)} satuan berjarak ${angka(state.jarak ?? 0)} satuan. Kedudukannya ${state.kedudukan ?? 'belum ditentukan'}.`;
}
