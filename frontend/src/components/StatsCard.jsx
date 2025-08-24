import { clsx } from 'clsx'

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  className = '',
  onClick
}) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    negative: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
  }

  const changeIcons = {
    positive: '↗',
    negative: '↘',
    neutral: '→'
  }

  const CardComponent = onClick ? 'button' : 'div'

  return (
    <CardComponent
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-center">
          {Icon && (
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-indigo-600" />
            </div>
          )}
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">
                {value}
              </dd>
            </dl>
          </div>
        </div>
        
        {change && (
          <div className="mt-4">
            <div className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              changeColors[changeType]
            )}>
              <span className="mr-1">{changeIcons[changeType]}</span>
              {change}
            </div>
          </div>
        )}
      </div>
    </CardComponent>
  )
}

export default StatsCard 