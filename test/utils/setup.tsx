import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const setup = (jsx: React.ReactElement) => ({
  user: userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  }),
  ...render(jsx),
})

export { setup }