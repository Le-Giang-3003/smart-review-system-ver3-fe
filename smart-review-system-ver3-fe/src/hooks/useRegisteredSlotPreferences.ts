import { useQuery } from '@tanstack/react-query'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import { lecturerApiService } from '@/api/lecturer.service'
import { studentApiService } from '@/api/student.service'
import type { ReviewPeriod, Semester, SlotPreferenceDto } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'
import { isApiSuccess } from '@/types/api'

export type RegisteredSlotsByPeriod = {
  reviewPeriodId: number
  reviewPeriodName: string
  preferences: SlotPreferenceDto[]
}

export function useRegisteredSlotPreferences(role: 'lecturer' | 'student', enabled: boolean) {
  return useQuery({
    queryKey: ['registered-slot-preferences-dashboard', role],
    queryFn: async (): Promise<RegisteredSlotsByPeriod[]> => {
      const semRes = await semesterService.getAll()
      const semesters = (semRes.data.data ?? []).filter((s: Semester) => s.isActive)
      const result: RegisteredSlotsByPeriod[] = []
      for (const sem of semesters) {
        const res = await reviewPeriodService.getBySemester(sem.id)
        const periods = extractListFromApiData<ReviewPeriod>(res.data?.data)
        for (const p of periods) {
          try {
            const prefRes =
              role === 'lecturer'
                ? await lecturerApiService.getMyLecturerPreferences(p.id)
                : await studentApiService.getMyGroupPreferences(p.id)
            const env = prefRes.data
            if (isApiSuccess(env) && env.data?.preferences?.length) {
              const prefs = [...env.data.preferences].sort((a, b) => a.priority - b.priority)
              result.push({
                reviewPeriodId: p.id,
                reviewPeriodName: env.data.reviewPeriodName,
                preferences: prefs,
              })
            }
          } catch {
            /* không có quyền / chưa gán nhóm — bỏ qua */
          }
        }
      }
      result.sort((a, b) => {
        const da = a.preferences[0]?.slotDate ?? ''
        const db = b.preferences[0]?.slotDate ?? ''
        return da.localeCompare(db)
      })
      return result
    },
    enabled,
  })
}
