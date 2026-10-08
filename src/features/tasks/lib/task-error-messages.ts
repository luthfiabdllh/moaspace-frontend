/**
 * Menerjemahkan pesan error mentah dari backend (task-transition.service.ts)
 * menjadi teks yang lebih jelas & actionable untuk ditampilkan di toast,
 * khususnya untuk kasus-kasus umum yang sering membingungkan pengguna saat
 * memindahkan task (drag-and-drop di Kanban maupun tombol ubah status di
 * panel detail task).
 */
export function friendlyTaskErrorMessage(rawMessage: string): string {
  if (!rawMessage) {
    return 'Gagal memindahkan task.';
  }

  if (rawMessage.includes('Story Point') && rawMessage.includes('wajib diisi')) {
    return 'Atur Story Point terlebih dahulu sebelum memindahkan task ini.';
  }

  if (rawMessage.includes('Assignee') && rawMessage.includes('wajib ditentukan')) {
    return 'Tentukan Assignee terlebih dahulu sebelum memindahkan task ini.';
  }

  return rawMessage;
}
