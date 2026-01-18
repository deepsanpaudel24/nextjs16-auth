//test suite are files with .test.tsx/jsx  or files inside __test__
// it/test block is a test case
// run pnpm test

//describe is used for grouping the test case
//using describe we can describe the what the test is about UI, Api
//describe.sikp or describe.only to skip or only run that case on pnpm test
//for events we have fireEvent.click or fireevent.change
//beforeAll, beforeEach will run before all the case or before each test case respectively
//afterAll, afterEach will run after all or each test cases





import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from "../app/settings/accounts/page"

beforeEach(()=>console.log("****hello***"))
 
describe('Testing account page', () => {
  it('renders a heading', () => {
    render(<Page />);
    
 
    const heading = screen.getByRole('heading', { level: 1 })

 
    expect(heading).toBeInTheDocument()
  })

  it('false is falsy', () => {
    expect(false).toBe(false);
  });

})