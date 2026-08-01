export interface LaboratoryTest {
  id: string;
  price: number;
  title: string;
  description: string;
}

export interface SelectionLine {
  testId: string;
  amount: number;
}

export interface SelectedLine extends SelectionLine {
  test: LaboratoryTest;
}
