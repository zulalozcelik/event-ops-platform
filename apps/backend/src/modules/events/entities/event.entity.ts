export class Event {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public location: string,
    public startDate: Date,
    public endDate: Date,
    public capacity: number,
    public status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED',
    public organizerId: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
