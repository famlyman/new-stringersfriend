import React from 'react';
import renderer from 'react-test-renderer';
import { DashboardCard } from '../DashboardCard';
import { Text } from 'react-native';

describe('DashboardCard', () => {
  const defaultProps = {
    title: 'Test Card',
    icon: 'briefcase-outline' as const,
    children: <Text>Test content</Text>,
  };

  it('renders correctly with title and icon', () => {
    const tree = renderer.create(<DashboardCard {...defaultProps} />);
    expect(tree).toMatchSnapshot();
  });

  it('displays empty state when no children provided', () => {
    const tree = renderer.create(
      <DashboardCard 
        title="Test Card"
        icon="briefcase-outline"
        emptyMessage="No items found"
        children={undefined}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('shows "View All" button when onViewAll is provided and has content', () => {
    const onViewAll = jest.fn();
    const tree = renderer.create(
      <DashboardCard {...defaultProps} onViewAll={onViewAll} />
    );
    expect(tree).toMatchSnapshot();
  });

  it('does not show "View All" button when no content', () => {
    const onViewAll = jest.fn();
    const tree = renderer.create(
      <DashboardCard 
        title="Test Card"
        icon="briefcase-outline"
        onViewAll={onViewAll}
        children={undefined}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const tree = renderer.create(
      <DashboardCard {...defaultProps} style={customStyle} testID="dashboard-card" />
    );
    expect(tree).toMatchSnapshot();
  });

  it('uses custom empty message and icon', () => {
    const tree = renderer.create(
      <DashboardCard 
        {...defaultProps} 
        emptyMessage="Custom empty message"
        emptyIcon="alert-circle-outline"
      />
    );
    expect(tree).toMatchSnapshot();
  });
}); 