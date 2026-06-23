/**
 * PLC Tag Okuma Scheduler
 * Periyodik okuma görevlerini yönetir
 */

class Scheduler {
  constructor(tagReader) {
    this.tagReader = tagReader;
    this.tasks = [];
    this.intervals = new Map();
  }

  /**
   * Periyodik görev ekle
   * @param {string} taskId - Görev ID
   * @param {Function} callback - Çalıştırılacak fonksiyon
   * @param {number} interval - Interval (ms)
   */
  addPeriodicTask(taskId, callback, interval) {
    if (this.intervals.has(taskId)) {
      console.warn(`Görev zaten var: ${taskId}`);
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        console.error(`Görev hatası [${taskId}]:`, error.message);
      }
    }, interval);

    this.intervals.set(taskId, {
      intervalId,
      interval,
      callback,
      createdAt: new Date()
    });

    console.log(`✓ Periyodik görev eklendi: ${taskId} (${interval}ms)`);
  }

  /**
   * Spesifik saatte görev çalıştır (Cron gibi)
   * @param {string} taskId - Görev ID
   * @param {string} time - Saat:Dakika (örn: "14:00")
   * @param {Function} callback - Çalıştırılacak fonksiyon
   */
  addDailyTask(taskId, time, callback) {
    if (this.intervals.has(taskId)) {
      console.warn(`Görev zaten var: ${taskId}`);
      return;
    }

    const [hour, minute] = time.split(':').map(Number);

    const executeDaily = async () => {
      const now = new Date();
      const taskTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

      // Eğer saat geçtiyse, yarın aynı saatte çalıştır
      let timeUntilTask = taskTime - now;
      if (timeUntilTask < 0) {
        taskTime.setDate(taskTime.getDate() + 1);
        timeUntilTask = taskTime - now;
      }

      setTimeout(async () => {
        try {
          console.log(`▶ Günlük görev çalıştırılıyor: ${taskId}`);
          await callback();
        } catch (error) {
          console.error(`Günlük görev hatası [${taskId}]:`, error.message);
        }

        // Sonraki gün için tekrar schedule et
        this.addDailyTask(taskId, time, callback);
      }, timeUntilTask);
    };

    executeDaily();
    console.log(`✓ Günlük görev eklendi: ${taskId} saat ${time}'de`);
  }

  /**
   * Tüm görevleri temizle
   */
  clearAll() {
    this.intervals.forEach((task, taskId) => {
      clearInterval(task.intervalId);
      console.log(`✓ Görev temizlendi: ${taskId}`);
    });
    this.intervals.clear();
  }

  /**
   * Belirli bir görevi durdur
   */
  stopTask(taskId) {
    if (this.intervals.has(taskId)) {
      clearInterval(this.intervals.get(taskId).intervalId);
      this.intervals.delete(taskId);
      console.log(`✓ Görev durduruldu: ${taskId}`);
    }
  }

  /**
   * Tüm görevleri listele
   */
  listTasks() {
    console.log('\n📋 Aktif Görevler:');
    if (this.intervals.size === 0) {
      console.log('  (Hiçbiri)');
      return;
    }

    this.intervals.forEach((task, taskId) => {
      console.log(`  - ${taskId} (${task.interval}ms)`);
    });
  }
}

module.exports = Scheduler;
