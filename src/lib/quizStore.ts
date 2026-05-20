import { Question, WrongQuizQuestion } from "@/api/generated/pickcaAPI.schemas";

export type QuizStoreQuestion = Question | WrongQuizQuestion;

/** quiz-settings → quiz 화면 간 데이터 전달용 모듈 레벨 스토어 */

let _questions: QuizStoreQuestion[] = [];

export function setQuizQuestions(questions: QuizStoreQuestion[]) {
  _questions = questions;
}

export function getQuizQuestions(): QuizStoreQuestion[] {
  return _questions;
}

export function clearQuizQuestions() {
  _questions = [];
}
