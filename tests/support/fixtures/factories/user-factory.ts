/**
 * User Factory
 * 
 * Generates test users with faker and provides auto-cleanup.
 * Knowledge Base: bmad/bmm/testarch/knowledge/data-factories.md
 * 
 * Pattern: Factory with overrides + auto-cleanup
 */

import { faker } from '@faker-js/faker';

export interface User {
  id?: string;
  email: string;
  name: string;
  password: string;
}

export class UserFactory {
  private createdUsers: string[] = [];

  /**
   * Create a test user with optional overrides
   * 
   * @param overrides - Override default generated values
   * @returns Created user object
   * 
   * Example:
   *   const user = await userFactory.createUser({ 
   *     email: 'test@example.com' 
   *   });
   */
  async createUser(overrides: Partial<User> = {}): Promise<User> {
    const user: User = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    };

    // TODO: Implement API call to create user when Epic 3 (Auth) is ready
    // Example:
    // const response = await fetch(`${process.env.API_URL}/api/users`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(user),
    // });
    // const created = await response.json();
    // this.createdUsers.push(created.id);
    // return created;

    // For now, return mock user (Epic 1 has no auth yet)
    const mockId = faker.string.uuid();
    this.createdUsers.push(mockId);
    
    return {
      ...user,
      id: mockId,
    };
  }

  /**
   * Auto-cleanup: Delete all users created by this factory
   * 
   * Called automatically by fixture after each test.
   */
  async cleanup() {
    // TODO: Implement user deletion when Epic 3 (Auth) is ready
    // Example:
    // for (const userId of this.createdUsers) {
    //   await fetch(`${process.env.API_URL}/api/users/${userId}`, {
    //     method: 'DELETE',
    //   });
    // }
    
    this.createdUsers = [];
  }
}

