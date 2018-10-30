import { Component, ViewChild, AfterViewInit,Inject } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// ruby test added
import { Ea_Product } from '../_models';
import { EaProductService, UserService } from '../_services';
import { first } from 'rxjs/operators';
import { Router} from '@angular/router';
import { CreateEaProductComponent} from './create-ea-product/create-ea-product.component';
import { EditEaProductComponent} from './edit-ea-product/edit-ea-product.component';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements AfterViewInit {
  displayedColumns = ['ea_id', 'ea_name', 'email', 'id'];
  dataSource: MatTableDataSource<EAData>;
  ea_products: Ea_Product[] = [];
  // ruby test
  newEaId: string;
  newEaName: string;
  newParameter: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor( private eaproductService: EaProductService,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    public toastr: ToastrManager
  ){}

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
    this.loadAllEaProducts();
  }

  deleteEaProduct = (id: number) => {
    console.log("ruby: del ea prod, id", id);
      this.eaproductService.delete(id).pipe(first()).subscribe(
        res => {
          this.toastr.successToastr('Successfully Deleted.', 'Success!', {animate: "slideFromTop"});
          this.loadAllEaProducts();
          // check for errors
        },
        error => {
            this.toastr.errorToastr('There might be some problems.', 'Error', {animate: "slideFromTop"});
        }
      );
  }

  private loadAllEaProducts() {
      this.eaproductService.getAll().pipe(first()).subscribe(ea_products => {
          this.ea_products = ea_products.data;
          
          const eadata: EAData[] = [];
          for (let i = 0; i < this.ea_products.length; i++) {
            eadata.push({
              ea_id: this.ea_products[i].ea_id,
              ea_name: this.ea_products[i].ea_name,
              email: this.ea_products[i].email,
              id: this.ea_products[i].id,
              parameter: this.ea_products[i].parameter,
              user_id: this.ea_products[i].user_id
            });
          }

          // Assign the data to the data source for the table to render
          this.dataSource = new MatTableDataSource(eadata);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
      });
  }

  openLiscense(ea_id: string) {
    console.log("ruby clicked here: ", ea_id);
    if(ea_id) {
      this.router.navigate(['/table/license', ea_id]);
    }
  }

  // ruby test
  openNewDialog(): void {
    const dialogRef = this.dialog.open(CreateEaProductComponent, {
      width: '480px',
      data: { newEaId: this.newEaId, newEaName: this.newEaName, newParameter: this.newParameter }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadAllEaProducts();
    });
  }


  editEaProduct(row: any): void {
    const dialogRef = this.dialog.open(EditEaProductComponent, {
      width: '480px',
      data: { selectedId: row.id, selectedEmail: row.email, selectedEaId: row.ea_id, selectedEaName: row.ea_name, selectedParameter: row.parameter
                , selectedUserId: row.user_id}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadAllEaProducts();
    });
  }
}

export interface EAData {
  ea_id: string;
  ea_name: string;
  email: string;
  id: number;
  parameter: string;
  user_id: number;
}
