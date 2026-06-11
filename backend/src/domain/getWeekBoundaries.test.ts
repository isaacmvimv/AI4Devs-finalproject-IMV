import { describe, expect, it } from 'vitest'
import { getWeekBoundaries } from './week'

describe('getWeekBoundaries', () => {
  describe('should_return_monday_to_sunday_boundaries_for_monday_input', () => {
    it('returns Monday 00:00 UTC to Sunday 23:59:59.999 UTC', () => {
      const date = new Date('2026-06-08T12:00:00.000Z')
      const { startDate, endDate } = getWeekBoundaries(date)

      expect(startDate.toISOString()).toBe('2026-06-08T00:00:00.000Z')
      expect(endDate.toISOString()).toBe('2026-06-14T23:59:59.999Z')
    })
  })

  describe('should_map_sunday_to_same_iso_week_starting_previous_monday', () => {
    it('returns boundaries for the week containing the Sunday', () => {
      const date = new Date('2026-06-14T15:00:00.000Z')
      const { startDate, endDate } = getWeekBoundaries(date)

      expect(startDate.toISOString()).toBe('2026-06-08T00:00:00.000Z')
      expect(endDate.toISOString()).toBe('2026-06-14T23:59:59.999Z')
    })
  })

  describe('should_handle_month_boundary_crossing', () => {
    it('returns correct boundaries when week spans two months', () => {
      const date = new Date('2026-07-01T10:00:00.000Z')
      const { startDate, endDate } = getWeekBoundaries(date)

      expect(startDate.toISOString()).toBe('2026-06-29T00:00:00.000Z')
      expect(endDate.toISOString()).toBe('2026-07-05T23:59:59.999Z')
    })
  })

  describe('should_handle_year_boundary_crossing', () => {
    it('returns correct boundaries for the first ISO week of the year', () => {
      const date = new Date('2026-01-01T12:00:00.000Z')
      const { startDate, endDate } = getWeekBoundaries(date)

      expect(startDate.toISOString()).toBe('2025-12-29T00:00:00.000Z')
      expect(endDate.toISOString()).toBe('2026-01-04T23:59:59.999Z')
    })

    it('returns correct boundaries for the last ISO week of the year', () => {
      const date = new Date('2025-12-31T18:00:00.000Z')
      const { startDate, endDate } = getWeekBoundaries(date)

      expect(startDate.toISOString()).toBe('2025-12-29T00:00:00.000Z')
      expect(endDate.toISOString()).toBe('2026-01-04T23:59:59.999Z')
    })
  })
})
