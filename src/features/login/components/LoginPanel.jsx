import { Cross } from 'lucide-react';

export default function LoginPanel({ children }) {
  return (
    <div className="w-full h-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Cross className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark max-sm:text-lg">
              Registro de Sacramentos
            </h1>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-muted-light dark:text-muted-dark">
            "Yo soy el camino, la verdad y la vida" - Juan 14:6
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}