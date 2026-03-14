export interface AiUpdate {
  answer: string;
  status: 'READY' | 'THINKING' | 'ERROR';
}