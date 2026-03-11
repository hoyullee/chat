import ora, { type Ora } from 'ora';

const isCI = process.env.CI === 'true';

export function createSpinner(text: string): Ora {
  return ora({
    text,
    isSilent: isCI,
  });
}

export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>
): Promise<T> {
  const spinner = createSpinner(text);
  spinner.start();
  try {
    const result = await fn();
    spinner.succeed();
    return result;
  } catch (err) {
    spinner.fail();
    throw err;
  }
}
